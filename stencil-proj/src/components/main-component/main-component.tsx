import { Component, h, Event, EventEmitter, State, Listen } from '@stencil/core';

// Interface for the service object
interface Service {
  name: string;
  type: string;
}

// Interface for the spatial reference object
interface SpatialReference {
  wkid: number;
  latestWkid: number;
}

// Interface for the full extent object
interface FullExtent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: SpatialReference;
}

// Interface for the service details object
interface ServiceDetails {
  isModalVisible: boolean;
  serviceName: string;
  description: string;
  fullExtent: FullExtent;
}

@Component({
  tag: 'main-component',
  styleUrl: 'main-component.scss', // Add the SCSS file
  shadow: true,
})
export class MainComponent {
  // Event emitter for the calciteModalClose event
  @Event() calciteModalClose: EventEmitter<void>;

  // State for the services array
  @State() services: Service[] = [];

  // State for the loading status
  @State() loading = true;

  // State for the service details object
  @State() serviceDetails: ServiceDetails = {
    isModalVisible: false,
    serviceName: null,
    description: null,
    fullExtent: null,
  };
 
  //function to remove all the html tags from a string (Required in service description as it contains some html tags )
   removeHtmlTags(inputString) {
    var cleanText = inputString.replace(/<.*?>/g, '');
    return cleanText;
  }
 
  //fetchServices function is triggered once just after the component is first connected to the DOM
  async componentWillLoad() {
    await this.fetchServices();
  }

  //function to fetch all the services 
  async fetchServices() {
    try {
      const response = await fetch('http://sampleserver6.arcgisonline.com/arcgis/rest/services?f=json');
      const data = await response.json();

      // Filter the services to get only the ones with type 'ImageServer'
      this.services = data?.services.filter((service: Service) => service.type === 'ImageServer');
    } catch (error) {
      alert('Error fetching services:')
      console.error('Error fetching services:', error);
    }
     this.loading = false
  }
 
 
  fetchServiceDetails(service) {
    //loading is set to true
    this.loading = true;
    const { name } = service;
    fetch(`http://sampleserver6.arcgisonline.com/arcgis/rest/services/${name}/ImageServer?f=json`)
      .then(response => response.json())
      .then(data => {
        //destructuring of response data
        const { serviceDescription, fullExtent } = data;

        //value of this.serviceDetails is set
        this.serviceDetails = {
          isModalVisible:true,
          serviceName: name,
          description: this.removeHtmlTags(serviceDescription),
          fullExtent: fullExtent,
        };
      })
      .catch(error => {

        //displays alert in case of an error
        alert('Error fetching service Details:')
        console.error('Error fetching Service Details:', error);
      }).then(() => {
        this.loading = false;
      } ) ;
  }

  @Listen('calciteModalClose')
  handleModalClose() {
    // Update the serviceDetails state to hide the modal
    this.serviceDetails = {
      ...this.serviceDetails,
      isModalVisible: false,
    };
  }


  render() {
    let serviceDetailComponent = (
      <div class="service-details">
        {!this.loading && (
          <calcite-modal aria-labelledby="modal-title" class="service-modal" open={this.serviceDetails.isModalVisible} fullscreen={true}>
            <div slot="header" id="modal-title">
              {this.serviceDetails.serviceName}
            </div>
            <div slot="content" class="content">
              <h2>Description</h2>
              <p>{this.serviceDetails.description}</p>
              {this.serviceDetails.fullExtent && (
                <img
                  height={600}
                  width={600}
                  src={`https://sampleserver6.arcgisonline.com/arcgis/rest/services/${this.serviceDetails.serviceName}/ImageServer/exportImage?f=image&bbox=${this.serviceDetails.fullExtent?.xmin}, ${this.serviceDetails.fullExtent?.ymin} ,${this.serviceDetails.fullExtent?.xmax} ,${this.serviceDetails.fullExtent?.ymax}&size=600,600&adjustAspectRatio=true&imageSR=${this.serviceDetails.fullExtent?.spatialReference?.latestWkid}  `}
                  alt={`${this.serviceDetails.serviceName} Full Extent Image`}
                />
              )}
            </div>
          </calcite-modal>
        )}
      </div>
    );

    return (
      <div class="main-component-container">
        <h1>List of Image Services</h1>
        {this.services.length > 0 && (
          <calcite-list selectionAppearance="border" loading={this.loading}>
            {this.services.map((element, index) => {
              return (
                <div
                  class="service-item"
                  key={index}
                  onClick={() => {
                    this.fetchServiceDetails(element);
                  }}
                >
                  <p class="title">{element.name}</p>
                  <p class="type">Type - {element.type}</p>
                </div>
              );
            })}
          </calcite-list>
        )}
        {serviceDetailComponent}
      </div>
    );
  }
}
