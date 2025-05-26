require('dotenv').config();

const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool promise
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function generarTicketPDF(cliente, venta, productos) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const dirTickets = path.join(__dirname, '../tickets');

      if (!fs.existsSync(dirTickets)) fs.mkdirSync(dirTickets);

      const filePath = path.join(dirTickets, `ticket_${Date.now()}.pdf`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Título
      doc.fontSize(18).text('NOTA DE VENTA', { align: 'center' }).moveDown(1.5);

      // Datos del cliente
      doc.fontSize(12)
        .text(`Cliente: ${cliente.nombre}`)
        .text(`Teléfono: ${cliente.telefono || 'N/A'}`)
        .text(`Dirección: ${cliente.direccion || 'N/A'}`)
        .text(`Correo: ${cliente.correo}`)
        .text(`Fecha: ${new Date().toLocaleString()}`)
        .moveDown();

      // Tabla de productos
      const tableTop = doc.y + 10;
      const itemX = 40;
      const columns = [itemX, 200, 280, 350];

      doc.fontSize(12).fillColor('#000').text('Producto', columns[0], tableTop, { bold: true });
      doc.text('Cantidad', columns[1], tableTop);
      doc.text('Precio', columns[2], tableTop);
      doc.text('Subtotal', columns[3], tableTop);

      doc.moveTo(itemX, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke();

      let y = tableTop + 25;

      productos.forEach((p) => {
        // Asegurarse que precio y subtotal sean números
        const precioNum = Number(p.precio);
        const subtotalNum = Number(p.subtotal);

        if (isNaN(precioNum) || isNaN(subtotalNum)) {
          throw new Error(`Precio o subtotal inválido para el producto ${p.name}`);
        }

        doc.fillColor('#333');
        doc.text(p.name, columns[0], y);
        doc.text(p.cantidad.toString(), columns[1], y);
        doc.text(`$${precioNum.toFixed(2)}`, columns[2], y);
        doc.text(`$${subtotalNum.toFixed(2)}`, columns[3], y);
        y += 20;
      });

      // Línea divisoria
      doc.moveTo(itemX, y)
        .lineTo(500, y)
        .stroke();

      // Totales
      y += 10;
      doc.fontSize(12).fillColor('#000');
      doc.text(`Subtotal:`, columns[2], y, { align: 'right' });
      doc.text(`$${venta.total.toFixed(2)}`, columns[3], y);

      y += 15;
      doc.text(`IVA (16%):`, columns[2], y, { align: 'right' });
      doc.text(`$${venta.iva.toFixed(2)}`, columns[3], y);

      y += 15;
      doc.font('Helvetica-Bold').text(`Total:`, columns[2], y, { align: 'right' });
      doc.text(`$${venta.total_with_iva.toFixed(2)}`, columns[3], y);

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function enviarCorreo(cliente, filePath) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: cliente.correo,
    subject: 'Nota de Venta - POS AdminRed',
    text: `Hola ${cliente.nombre}, adjunto la nota de su compra, vuelva pronto.`,
    attachments: [{ filename: 'nota_venta.pdf', path: filePath }],
  });
}

router.post('/', async (req, res) => {
  try {
    const { carrito, total, iva, total_with_iva, user_id, cliente } = req.body;

    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío o no es válido' });
    }
    if (!cliente || !cliente.correo) {
      return res.status(400).json({ error: 'Faltan datos del cliente o correo' });
    }

    const ids = carrito.map(item => item.id);
    const placeholders = ids.map(() => '?').join(',');

    // Validar productos y stock
    const [productos] = await db.query(`SELECT id, name, stock, min_stock FROM products WHERE id IN (${placeholders})`, ids);

    const errores = [];

    for (const item of carrito) {
      const p = productos.find(x => x.id === item.id);
      if (!p) errores.push(`Producto ID ${item.id} no encontrado`);
      else if (item.cantidad > p.stock) errores.push(`Sin stock suficiente para ${p.name}`);
      else if (p.stock - item.cantidad < p.min_stock) errores.push(`Stock mínimo excedido para ${p.name}`);

      item.name = p?.name;

      // Asegurarse que precio y subtotal sean numéricos (en el carrito deben venir así)
      item.precio = Number(item.precio);
      item.subtotal = Number(item.subtotal);
    }

    if (errores.length > 0) return res.status(400).json({ detalles: errores });

    // Insertar venta
    const [resultVenta] = await db.query(
      'INSERT INTO sales (user_id, total, iva, total_with_iva) VALUES (?, ?, ?, ?)',
      [user_id, total, iva, total_with_iva]
    );

    const saleId = resultVenta.insertId;
    const detalles = carrito.map(i => [saleId, i.id, i.cantidad, i.subtotal]);

    // Insertar detalles venta con placeholders dinámicos
    const placeholdersDetalles = detalles.map(() => '(?, ?, ?, ?)').join(', ');
    const flatValues = detalles.flat();

    await db.query(
      `INSERT INTO sale_details (sale_id, product_id, quantity, subtotal) VALUES ${placeholdersDetalles}`,
      flatValues
    );

    // Actualizar stock
    await Promise.all(
      carrito.map(i =>
        db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [i.cantidad, i.id])
      )
    );

    // Generar PDF y enviar correo
    const filePath = await generarTicketPDF(cliente, { total, iva, total_with_iva }, carrito);
    await enviarCorreo(cliente, filePath);

    res.json({ message: 'Venta exitosa y ticket enviado' });
  } catch (error) {
    console.error('Error en /sales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
