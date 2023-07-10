import { Component } from './base-component';

import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project'

import { Autobind } from './../decorators/autobind';



//* ProjectItem Class (responsible for rendering a single project item, instance used inside ProjectList Class)
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get Persons() {
        return this.project.people === 1 ? ' person' : ' persons';
    }

    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData("text/plain", this.project.id); //! dataTransfer property to attach the data and be able to extract it later through the id (storing the data behind the scenes during the drag operation)
        event.dataTransfer!.effectAllowed = 'move'; //! effectAllowed controls how the cursor will look and tells the browser that we plan to move an element from A -> B
    }

    @Autobind
    dragEndHandler(_: DragEvent): void {
        console.log('Drag End');
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    };

    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.project.people.toString() + this.Persons + ' assigned';
        this.element.querySelector("p")!.textContent = this.project.description;
    };
}

