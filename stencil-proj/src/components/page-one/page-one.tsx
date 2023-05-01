import { Component, h, Event, EventEmitter, State, Listen } from '@stencil/core';

interface Service {
  name: string;
  type: string;
}

interface SpatialReference {
  wkid: number;
  latestWkid: number;
}

interface FullExtent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: SpatialReference;
}

interface ServiceDetails {
  isModalVisible: boolean;
  serviceName: string;
  description: string;
  fullExtent : FullExtent
}


@Component({
  tag: 'page-one',
  styleUrl: 'page-one.css', // Add the SCSS file
  shadow: true,
})
export class PageOne {
  @Event() nextClick: EventEmitter<{ key: string }>;
  @Event() calciteModalClose: EventEmitter<void>;
  @State() services: Service[] = [];
  @State() loading = true;
  @State() serviceDetails: ServiceDetails = {
    isModalVisible: false,
    serviceName: null,
    description: null,
    fullExtent: null
  };

  async componentWillLoad() {
    await this.fetchServices();
  }

  async fetchServices() {
    try {
      const response = await fetch('http://sampleserver6.arcgisonline.com/arcgis/rest/services?f=json');
      const data = await response.json();
      // Filter the services to get only the ones with type 'ImageServer'
      this.services = data?.services.filter((service: Service) => service.type === 'ImageServer');
      this.loading = false;
    } catch (error) {
      console.error('Error fetching services:', error);
      this.loading = false;
    }
  }

   handleClickService(service : Service) {
    this.loading= true;
    this.serviceDetails = {
      isModalVisible: true,
      serviceName: null,
      description: null,
      fullExtent: null
    }
     this.fetchServiceDetails(service)
  }

  fetchServiceDetails(service) {
    const { name } = service;
    fetch(`http://sampleserver6.arcgisonline.com/arcgis/rest/services/${name}/ImageServer?f=json`)
      .then(response => response.json())
      .then(data => {
        const { serviceDescription, fullExtent } = data;
  
        this.serviceDetails = {
          ...this.serviceDetails,
          serviceName: name,
          description: serviceDescription,
          fullExtent: fullExtent
        };
  
        this.loading = false;
      })
      .catch(error => {
        console.error('Error fetching services:', error);
        this.loading = false;
      });
  }
  

  @Listen('calciteModalClose')
  handleModalClose() {
    // Update the serviceDetails state to hide the modal
    this.serviceDetails = {
      isModalVisible: false,
      serviceName: null,
      description: null,
      fullExtent: null
    };
    // Add your logic here for handling the modal close event
  }

  render() {
    let serviceDetailComponent = (
      <div class="service-details">
        {!this.loading && (
           <calcite-modal
           aria-labelledby="modal-title"
           class="service-modal"
           open={this.serviceDetails.isModalVisible}
           fullscreen={true}
         >
           <div slot="header" id="modal-title">
             {this.serviceDetails.serviceName}
           </div>
           <div slot="content" class="content">
            <h2>Description</h2>
            <p>{this.serviceDetails.description}</p>
            <img height={600} width={600}  src={`https://sampleserver6.arcgisonline.com/arcgis/rest/services/${this.serviceDetails.serviceName}/ImageServer/exportImage?f=image&bbox=${this.serviceDetails.fullExtent?.xmin}, ${this.serviceDetails.fullExtent?.ymin } ,${this.serviceDetails.fullExtent?.xmax } ,${this.serviceDetails.fullExtent?.ymax }&size=600,600&adjustAspectRatio=true  `} alt="Example Image" />
           </div>
          
         </calcite-modal>
        )}
       
      </div>
    );


    return (
      <div class="page-one-container">
        <h1>List of Image Services</h1>
        {this.services.length > 0 ? (
          <calcite-list selectionAppearance="border" loading={this.loading}>
            {this.services.map((element, index) => {
              return (
                <div
                  class="service-item"
                  key={index}
                  onClick={() => {
                    this.handleClickService(element);
                  }}
                >
                  <p class="title">{element.name}</p>
                  <p class="type">Type - {element.type}</p>
                </div>
              );
            })}
          </calcite-list>
        ) : (
          <h1> Loading </h1>
        )}
        {serviceDetailComponent}
      </div>
    );
  }
}

