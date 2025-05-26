CREATE DATABASE pos_system;

USE pos_system;

-- Tabla de Categorías
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla de Usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL
);

-- Tabla de Productos (con referencia a la categoría)
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  min_stock INT NOT NULL,
  max_stock INT NOT NULL,
  category_id INT,  -- Nueva columna que referencia la categoría
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabla de Ventas
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(10, 2) NOT NULL,
  total_with_iva DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Detalles de Venta
CREATE TABLE sale_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT,
  product_id INT,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO users (username, password, role)
VALUES (
  'admin1',
  '$2b$10$2b6Y2Zcf.CcC1BxEM.4DLeB6EM6vPgHDn9rSnmEQ7daM84dNF/hkK', -- contraseña: admin123
  'admin'
);

SELECT * FROM users;

SELECT * FROM users WHERE username = 'admin1';

DELETE FROM users;

INSERT INTO users (username, password, role)
VALUES ('admin1', 'admin123', 'admin');

INSERT INTO users (username, password, role)
VALUES ('empleado1', 'emp123', 'employee');

INSERT INTO categories (name)
VALUES ('Cervezas');

SELECT id FROM categories WHERE name = 'Cervezas';

INSERT INTO products (name, price, stock, min_stock, max_stock, category_id)
VALUES ('Corona 355ml', 18.50, 20, 10, 100, 1);

SELECT * FROM products;

CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

ALTER TABLE products
  ADD COLUMN capacity VARCHAR(50),
  ADD COLUMN pack_quantity INT,
  ADD COLUMN brand_id INT,
  ADD CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES brands(id);

CREATE TABLE containers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL
);

ALTER TABLE products
  ADD COLUMN container_id INT,
  ADD CONSTRAINT fk_container FOREIGN KEY (container_id) REFERENCES containers(id);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  correo VARCHAR(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM CLIENTES;

INSERT INTO brands (name)
VALUES ('Tecate');

INSERT INTO containers (type)
VALUES ('Lata');

SELECT*FROM CONTAINER;

select*from brands;

INSERT INTO brands (name) VALUES 
('Coca Cola'),
('Pepsi'),
('Sidral Mundet'),
('Jarritos'),
('Sangría Señorial'),
('Fanta'),
('Sprite'),
('7up'),
('Squirt'),
('Manzanita Sol'),
('Peñafiel'),
('Big Cola'),
('Crush'),
('Fresca'),
('Topo Chico'),
('Jumex'),
('Del Valle'),
('Clamato'),
('Ades'),
('Frutsi'),
('Vitaloe'),
('Arizona'),
('Corona'),
('Modelo'),
('Tecate'),
('Sol'),
('Minerva'),
('Cucapá'),
('Loba'),
('Heineken'),
('Butweiser'),
('Pacifico'),
('Victoria'),
('Bohemia'),
('Carta Blanca'),
('Indio'),
('Barrilito'),
('Imperial'),
('José Cuervo'),
('Patrón'),
('Sauza'),
('Cazadores'),
('Herradura'),
('Don Julio'),
('1800'),
('El Jimador'),
('Bonafont'),
('Del Maguey'),
('Monte Xanic'),
('Amores'),
('Alipus'),
('Epura'),
('Crema De Tequila'),
('Triple Sec'),
('Bang Energy'),
('Vive 100'),
('Amp Energy'),
('Gatorade'),
('Powerade'),
('Electrolit Sport'),
('Valle Redondo'),
('Café Gardello'),
('Fuze Tea'),
('Nescafé To Go'),
('Lipton'),
('Santa Maria'),
('El Silencio'),
('Fidencio'),
('Skarch'),
('Ciel'),
('Amaretto Di Saronno'),
('Baileys'),
('Licor 43'),
('Jägermeister'),
('Kahlúa'),
('Ancho Reyes'),
('Rompe Santa Clara'),
('Red Bull'),
('Monster Energy'),
('Volt'),
('Isostar'),
('Casa Madero'),
('Los Vascos'),
('Santa Rita'),
('Teazone'),
('Té Chai');

select*From categories;

INSERT INTO categories (name) VALUES
('Mezcales'),
('Aguas Embotelladas'),
('Licores'),
('Bebidas Energizantes'),
('Bebidas Deportivas'),
('Vinos'),
('Cafés Instantáneos'),
('Tés'),
('Aguas Minerales'),
('Jugos'),
('Bebidas'),
('Tequilas');



