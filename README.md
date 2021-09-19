# Innovators 2021 - Hack reto Onesait Platform

![cover_innovators_2021_fjlacevedo](https://user-images.githubusercontent.com/55378589/125307550-6fe2c500-e330-11eb-8a30-7e78c35f6185.jpg)

## Detección y reconocimiento de acumulación de basura en islas de reciclaje

Esta idea busca poder detectar la acumulación de residuos de diversa índole en el perímetro de los contenedores de reciclaje, reconociendo cuando se encuentran limpios de basura aledaña, o por el contrario se requiere de su limpieza por parte de los agentes de limpieza.

Mediante detección y reconocimiento de imagen sería posible detectar cuando los contendores requieren de su limpieza. Esto se podría llevar a cabo usando una cámara que analizase la imagen del contenedor, y si detecta un exceso de basura, lance una alarma geoposicionando la localización del contenedor a partir de la geocerca definida para dicha isla.

Todo eso se podrá visualizar desde un panel de mando que permitirá visualizar la localización de las islas de contendores de reciclaje, con una gestión de alarmas que informase de cuando algún contenedor requiere de su limpieza, mostrando incluso una imagen de los residuos, para su valoración por parte de los agentes de limpieza.

---

## Panel de mando

El panel de mando se encuentra disponible en la siguiente dirección: https://lab.onesaitplatform.com/web/Innovators2021_waste_project/login.html

![webproject_login_fjlacevedo](https://user-images.githubusercontent.com/55378589/133936164-08dfa0d9-7522-4f11-98e7-a2359118afa1.png)

Los datos de acceso son los siguientes:
- **Usuario**: inner_waste
- **Contraseña**: inner_Waste_2001

![webproject_index_fjlacevedo](https://user-images.githubusercontent.com/55378589/133936517-16337219-c888-4a60-8588-aaf049b5e433.png)

Conforme el usuario saque una fotografía de un contenedor, tanto el estado como la fotografía del contenedor en el mapa, así como la fecha de última actualización y estado del conteendor en la tabla, se actualizarán en tiempo real (~5 segundos).

Aquellos contenedores que presenten un estado normal se representarán de con un icono de color verde en el mapa, mientras que aquellos que presenten una alarma saldrán de color rojo. Los elementos seleccionados del mapa presentarán un icono de color amarillo oscuro y de un mayor tamaño.

Además, aquellos contenedores que tengan fotografía contendrán un icono adicional de una cámara dentro de un círculo blanco. Si carecen de ella, no mostrarán dicho icono.

![symbology_fjlacevedo](https://user-images.githubusercontent.com/55378589/133936519-461a31c1-774d-4bc7-b028-ad861eca6867.png)
