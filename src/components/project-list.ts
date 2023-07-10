import { Component } from './base-component';

import { projectState } from './../state/project-state';
import { ProjectItem } from './project-item';

import { DragTarget } from '../models/drag-drop'
import { Project, ProjectStatus } from '../models/project';

import { Autobind } from '../decorators/autobind';


//* ProjectList Class (Class for rendering the data in lists)
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.items[0].type === 'text/plain') {
            event.preventDefault(); //! because the default behavior in js is not allowing dropping and we need to make the drop handler works
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add('droppable');
        }

    }

    @Autobind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @Autobind
    dragLeaveHandler(event: DragEvent): void {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove('droppable');
    }

    configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        //! whenever i call addListner in any place it takes the function and push it to array so when i click button there's method gets called to call my callback function
        projectState.addListener((projects: Project[]) => { //! this callback function will get called after i hit the button to add new project through addProject method inside ProjectState Class
            const filteredProjects = projects.filter(prj => {
                if (this.type === "active") return prj.status === ProjectStatus.Active;
                if (this.type === "finished") return prj.status === ProjectStatus.Finished

            })
            this.assignedProjects = filteredProjects;
            this.renderProjects();
        })
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
            // const listItem = document.createElement("li");
            // listItem.textContent = prjItem.title;
            // listEl.appendChild(listItem);
        }
    }
}
