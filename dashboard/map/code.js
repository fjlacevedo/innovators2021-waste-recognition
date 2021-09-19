vm.vueconfig = {
  el: document.querySelector('#' + vm.id + ' vuetemplate'),
  data: {
    ds: [],
    map: {
      type: Object,
      default: {},
    },
    loaded: false,
    layer: undefined,
    selectedFeature: undefined,
    symbology: {
      noImage:
        'https://lab.onesaitplatform.com/web/Innovators2021_waste_project/assets/dashboard/img/no_image.jpg',
      camera:
        'https://lab.onesaitplatform.com/web/Innovators2021_waste_project/assets/dashboard/img/camera.png',
      video:
        'https://lab.onesaitplatform.com/web/Innovators2021_waste_project/assets/dashboard/img/video-camera.png',
    },
  },
  methods: {
    drawVueComponent: function (newData, oldData) {
      /** Check if is the first time to load the data. If not, update the layer */
      if (!this.loaded) {
        this.loaded = true
        this.createLayer()
        this.loadLayer(newData)
      } else {
        this.updateLayer(newData)
      }
    },
    resizeEvent: function () {
      /** Update the map viewport to adapt it to the new screen size */
      setTimeout(() => {
        this.map.updateSize()
      }, 200)
      //Resize event
    },
    destroyVueComponent: function () {
      vm.vueapp.$destroy()
    },
    receiveValue: function (data) {
      //data received from datalink
    },
    sendValue: vm.sendValue,
    sendFilter: vm.sendFilter,

    //

    /** Create the map object. As default, use the OpenStreetMap as basemap */
    createMap() {
      const osmBasemap = new ol.layer.Tile({
        source: new ol.source.OSM(),
      })

      this.map = new ol.Map({
        target: this.$refs.map,
        layers: [osmBasemap],
        controls: ol.control.defaults({
          zoom: true,
          attribution: false,
        }),
        view: new ol.View({
          center: ol.proj.fromLonLat([-3.673374, 40.40085]),
          zoom: 18,
          maxZoom: 20,
          minZoom: 13,
        }),
      })

      /** This is needed as using a gadget to store the map */
      setTimeout(() => {
        this.map.updateSize()
      }, 200)
    },

    createLayer() {
      /** Set the map element */
      const map = this.map

      /** Create the vector source object (will be empty) */
      const source = new ol.source.Vector()

      /** Create the layer from the source */
      const layer = new ol.layer.Vector({
        source: source,
      })

      /** Add some properties to the layer */
      layer.set('name', 'Dumpsters')

      /** Add the layer to the map */
      map.addLayer(layer)

      /** Store the layer as a Vue data element */
      this.layer = layer
    },

    loadLayer(data) {
      /** Get the layer to update */
      const layer = this.layer

      /** If the layer doesn't exists, stop */
      if (!layer) return

      /** Iterate each dumpster object to create the feature and style it */
      data.forEach((entity) => {
        /** This will create the default feature */
        const feature = new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.transform(
              [entity.position.longitude, entity.position.latitude],
              'EPSG:4326',
              'EPSG:3857'
            )
          ),
        })

        /** Add the metadata to the feature */
        feature.setProperties({
          id: entity.metadata.id,
          lastUpdated: entity.status.updated,
          info: {
            image: entity.status.image,
            address_name: entity.metadata.address_name,
            address_number: entity.metadata.address_number,
            address_type: entity.metadata.address_type,
            address:
              entity.metadata.address_type +
              ' ' +
              entity.metadata.address_name +
              ', ' +
              entity.metadata.address_number,
            id_district: entity.metadata.id_district,
            id_neighborhood: entity.metadata.id_neighborhood,
            neighborhood: entity.metadata.neighborhood,
            dumpsterType: entity.metadata.type,
          },
          status: {
            alarm: entity.status.alarm,
            supervised: entity.status.supervised,
          },
        })

        /** Set the styles */
        this.styleFeature(feature)

        /** Add the feature to the layer */
        layer.getSource().addFeature(feature)
      })

      /** Zoom to layer */
      this.map.getView().fit(layer.getSource().getExtent(), {
        size: this.map.getSize(),
        maxZoom: 17,
      })
    },

    updateLayer(data) {
      /** Get the layer to update */
      const layer = this.layer

      /** If the layer doesn't exists, stop */
      if (!layer) return

      /** Iterate each feature of the layer */
      layer.getSource().forEachFeature((feature) => {
        /** Get the feature unique ID */
        const featureId = feature.get('id')

        /** From the new data, get the object that has the same ID value */
        const newFeature = data.filter((x) => x.metadata.id === featureId)[0]

        /** If there is a match, proceed with the update */
        if (newFeature) {
          /** Get the current feature alarm status */
          const featureStatus = feature.get('status').alarm

          /** Get the new feature alarm status */
          const newFeatureStatus = newFeature.status.alarm

          /** If the current and new status are different, proceed to update */
          if (featureStatus !== newFeatureStatus) {
            /** Update the feature property */
            feature.get('status').alarm = newFeatureStatus

            /** Change the style */
            this.styleFeature(feature)
          }

          /** Get the new feature image */
          const newFeatureImage = newFeature.status.image
          feature.get('info').image = newFeatureImage
        }
      })
    },

    styleFeature(feature) {
      /** Get the alarm property of the feature */
      const alarm = feature.get('status').alarm
      let style = []

      /** If the dumpster is right, set it green; if not, red */
      if (!alarm) {
        style.push(
          new ol.style.Style({
            image: new ol.style.Circle({
              stroke: new ol.style.Stroke({
                color: '#003027',
                width: 2,
              }),
              fill: new ol.style.Fill({
                color: '#00614E',
              }),
              radius: 15,
            }),
          })
        )
      } else {
        style.push(
          new ol.style.Style({
            image: new ol.style.Circle({
              stroke: new ol.style.Stroke({
                color: '#800020',
                width: 2,
              }),
              fill: new ol.style.Fill({
                color: '#EE4B2B',
              }),
              radius: 15,
            }),
          })
        )
      }

      style.push(
        new ol.style.Style({
          image: new ol.style.Icon({
            src: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTI4IDEyOCIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Im0xMDMuMSA0Ni41Yy0uMy0uOC00LjUtMTMuNS02LTE4LS4yLS43LS45LTEuMi0xLjctMS4yLTQuMSAwLTYwLjUgMC02Mi45IDAtLjggMC0xLjQuNS0xLjcgMS4yLTEuNSA0LjUtNS41IDE2LjQtNiAxOC0uMS4yLS4xLjMtLjEuNXY4YzAgMSAuOCAxLjggMS44IDEuOGgyLjZ2MzQuNmMwIDEgLjggMS43IDEuNyAxLjhoMi4zdjUuOGMwIDEgLjggMS43IDEuNyAxLjhoNy42YzEgMCAxLjctLjggMS44LTEuN3YtNS44aDM5LjR2NS43YzAgMSAuOCAxLjggMS44IDEuOGg3LjZjMSAwIDEuNy0uOCAxLjgtMS43di01LjhoMi4zYzEgMCAxLjctLjggMS44LTEuN3YtMzQuOGgyLjZjMSAwIDEuOC0uOCAxLjgtMS44IDAgMCAwLTYgMC04LS4xLS4yLS4xLS4zLS4yLS41em0tNC4xLTEuMmgtMTYuN2wtMi4yLTE0LjVoMTQuMXptLTIyLjQtMTQuNSAyLjIgMTQuNWgtMjkuNmwyLjItMTQuNXptLTQyLjggMGgxNC4xbC0yLjIgMTQuNWgtMTYuN3ptNyA2Ni40aC00LjF2LTQuMWg0LjF6bTUwLjUgMGgtNC4xdi00LjFoNC4xem00LjEtNy42aC02Mi44di0zMi44aDYyLjh6bS02Ny4xLTM2LjN2LTQuNWg3MS40djQuNXoiLz48L2c+PC9zdmc+',
            color: 'white',
            scale: 0.05,
          }),
        })
      )

      if (feature.get('info').image) {
        style.push(
          new ol.style.Style({
            image: new ol.style.Circle({
              displacement: [20, 20],
              stroke: new ol.style.Stroke({
                color: 'black',
                width: 1,
              }),
              fill: new ol.style.Fill({
                color: 'white',
              }),
              radius: 10,
            }),
          })
        )

        style.push(
          new ol.style.Style({
            image: new ol.style.Icon({
              src: this.symbology.camera,
              scale: 0.7,
              anchor: [36, 36],
              anchorOrigin: 'top-right',
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
            }),
          })
        )
      }

      /** Add the style to the feature */
      feature.setStyle(style)
    },

    styleSelectedFeature(feature, selected) {
      if (!feature) return

      if (selected) {
        const style = []

        style.push(
          new ol.style.Style({
            image: new ol.style.Circle({
              stroke: new ol.style.Stroke({
                color: '#825500',
                width: 2,
              }),
              fill: new ol.style.Fill({
                color: '#CC8400',
              }),
              radius: 18,
            }),
          })
        )

        style.push(
          new ol.style.Style({
            image: new ol.style.Icon({
              src: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTI4IDEyOCIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Im0xMDMuMSA0Ni41Yy0uMy0uOC00LjUtMTMuNS02LTE4LS4yLS43LS45LTEuMi0xLjctMS4yLTQuMSAwLTYwLjUgMC02Mi45IDAtLjggMC0xLjQuNS0xLjcgMS4yLTEuNSA0LjUtNS41IDE2LjQtNiAxOC0uMS4yLS4xLjMtLjEuNXY4YzAgMSAuOCAxLjggMS44IDEuOGgyLjZ2MzQuNmMwIDEgLjggMS43IDEuNyAxLjhoMi4zdjUuOGMwIDEgLjggMS43IDEuNyAxLjhoNy42YzEgMCAxLjctLjggMS44LTEuN3YtNS44aDM5LjR2NS43YzAgMSAuOCAxLjggMS44IDEuOGg3LjZjMSAwIDEuNy0uOCAxLjgtMS43di01LjhoMi4zYzEgMCAxLjctLjggMS44LTEuN3YtMzQuOGgyLjZjMSAwIDEuOC0uOCAxLjgtMS44IDAgMCAwLTYgMC04LS4xLS4yLS4xLS4zLS4yLS41em0tNC4xLTEuMmgtMTYuN2wtMi4yLTE0LjVoMTQuMXptLTIyLjQtMTQuNSAyLjIgMTQuNWgtMjkuNmwyLjItMTQuNXptLTQyLjggMGgxNC4xbC0yLjIgMTQuNWgtMTYuN3ptNyA2Ni40aC00LjF2LTQuMWg0LjF6bTUwLjUgMGgtNC4xdi00LjFoNC4xem00LjEtNy42aC02Mi44di0zMi44aDYyLjh6bS02Ny4xLTM2LjN2LTQuNWg3MS40djQuNXoiLz48L2c+PC9zdmc+',
              color: 'white',
              scale: 0.05,
            }),
          })
        )

        /** Add the style to the feature */
        feature.setStyle(style)
      } else {
        this.styleFeature(feature)
      }
    },

    setPopup() {
      /** Set the map element */
      const map = this.map

      const popupDiv = {
        container: this.$refs.popup,
        title: this.$refs.popupTitle,
        img: this.$refs.popupImg,
        content: this.$refs.popupContent,
        closer: this.$refs.popupCloser,
        popupC2D: this.$refs.popupC2D,
      }

      const popup = new ol.Overlay({
        element: popupDiv.container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      })

      /** Add the popup to the map (hidden, by default) */
      map.addOverlay(popup)

      /** Yup, this is gloss; doing this *NOW* you can force an overwrite of the
       * positioning property. OL still doesn't fix it, so this is the answer */
      popup.setPositioning('bottom-center')
      popup.setOffset([0, -20])

      popupDiv.closer.onclick = () => {
        /** Try to get the selected feature from the Vue data collector */
        const feature = this.selectedFeature

        /** Check if the feature exists, and restore it default symbology */
        if (feature) {
          this.styleSelectedFeature(feature, false)
          this.selectedFeature = undefined
        }

        /** Hide the popup */
        popup.setPosition(undefined)

        /** More fancy effects */
        popupDiv.closer.blur()

        return false
      }

      popupDiv.popupC2D.onclick = () => {
        /** Try to get the selected feature from the Vue data collector */
        console.log('HERE WILL BE A CALL TO THE M5...')
        return false
      }

      this.selectFeature(popup, popupDiv, map)
    },

    selectFeature(popup, popupDiv, map) {
      const select = new ol.interaction.Select()

      map.addInteraction(select)

      select.on('select', (e) => {
        const feature = e.selected[0]
        if (!feature) {
          /** Set the default point symbology */
          this.styleSelectedFeature(feature, false)

          /** Hide the popup */
          popup.setPosition(undefined)

          return
        }

        /** Change the symbology of the point */
        this.styleSelectedFeature(feature, true)

        /** Store the feature in the Vue data collector to be accesible when
         * pushing the X in the popup */
        this.selectedFeature = feature

        /** Get the coordinates of the selected point */
        const position = feature.getGeometry().getCoordinates()

        /** Update the popup position to the centroid of the point */
        popup.setPosition(position)

        /** Update the fancy popup */
        popupDiv.title.innerHTML = feature.get('id')

        if (feature.get('info').image) {
          popupDiv.img.src =
            'data:image/jpeg;base64,' + feature.get('info').image
        } else {
          popupDiv.img.src = this.symbology.noImage
        }

        const info = feature.get('info')

        /** Update the fancy popup */
        popupDiv.content.innerHTML =
          '<p><span style="font-weight:bold">Address</span>: ' +
          info.address +
          '</p>' +
          '<p><span style="font-weight:bold">Waste</span>: ' +
          info.dumpsterType +
          '</p>' +
          '<p><span style="font-weight:bold">Neighborhood</span>: ' +
          info.neighborhood +
          ' (' +
          info.id_neighborhood +
          ')</p>'
      })
    },
  },
  mounted() {
    this.createMap()
    this.setPopup()
  },
}

//Init Vue app
vm.vueapp = new Vue(vm.vueconfig)
