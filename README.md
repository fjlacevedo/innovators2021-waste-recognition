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
- **Usuario**: inno_waste
- **Contraseña**: inno_Waste_2001

![webproject_index_fjlacevedo](https://user-images.githubusercontent.com/55378589/133936517-16337219-c888-4a60-8588-aaf049b5e433.png)

Conforme el usuario saque una fotografía de un contenedor, tanto el estado como la fotografía del contenedor en el mapa, así como la fecha de última actualización y estado del conteendor en la tabla, se actualizarán en tiempo real (~5 segundos).

Aquellos contenedores que presenten un estado normal se representarán de con un icono de color verde en el mapa, mientras que aquellos que presenten una alarma saldrán de color rojo. Los elementos seleccionados del mapa presentarán un icono de color amarillo oscuro y de un mayor tamaño.

Además, aquellos contenedores que tengan fotografía contendrán un icono adicional de una cámara dentro de un círculo blanco. Si carecen de ella, no mostrarán dicho icono.

![symbology_fjlacevedo](https://user-images.githubusercontent.com/55378589/133936519-461a31c1-774d-4bc7-b028-ad861eca6867.png)


---

## Dispositivo de captura de datos

Para la obtención del estado de los contenedores, así como de una imagen del mismo, se ha utilizado un dispositivo M5StickV (que contienen un chip Kendryte K210 para procesado de visión artificial). Tanto la detección del estado de los contenedores como la imagen es transmitida vía cable a un dispositivo M5StickC, que es el que se ocupa de conectarse a internet, negociar la conexión MQTT y mandar la información recibida a la Onesait Platform para su ingesta en una entidad de registro.

El dispositivo M5StickC se ha configurado para mostrar en pantalla una serie de información que permita al usuario conocer en todo momento lo que ocurre.

### Inicialización del dispositivo

![img_m5_01](https://user-images.githubusercontent.com/55378589/134138428-a15c98b8-027c-4f07-98a6-95c2c0761916.jpg)


### Conexión exitosa a la red WiFi

![img_m5_02](https://user-images.githubusercontent.com/55378589/134138465-6e102a07-24a6-470b-bf73-8d20c13f41f9.jpg)


### Dispositivo en espera de recibir datos de manera automática desde el M5StickV

![img_m5_03](https://user-images.githubusercontent.com/55378589/134138510-8fa88860-c98e-4f9e-9bf4-7ba34bcb6a16.jpg)


El UI del M5StickV no se ha modificado por falta de tiempo, más allá de mostrar información de cuando se ha tomado una foto, y de si se ha detectado un contenedor que presenta una alarma de suciedad o no.
