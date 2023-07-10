//* Drag & Drop Interfaces 
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void; //! to tell the browser that the place you are dragging over it is a valid drag target place (fires awl m t5ush 3al place)
    dropHandler(event: DragEvent): void; //! to react to the actual drop that happens.
    dragLeaveHandler(event: DragEvent): void; //! to give some visual feedback to the user or if no drop happens and instead it canceled or the user moves the element away.
}


//* validate function for all inputs
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true;

    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }

    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }

    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }

    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }

    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    return isValid;
}

//* Autobind Decorator (Method Decorator) (This is a Decorator just to bind the this to any event handler method to make it refers to the object itself rather than to the formElement which got the event on)
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}


//* abstract Component Class(renders the ui) (This is the base clase that other classes [ProjectList,ProjectInput] inherits it to not duplicate the code , and we don't need to make instance from this class so we make it as an abstract class)
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateElementId: string, hostElementId: string, insertAtStart: boolean, elementId?: string) {
        this.templateElement = document.getElementById(templateElementId) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId) as T;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if (elementId) {
            this.element.id = elementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//* Project Class to make an instance of it(using it as a type) (project instance that we add)
enum ProjectStatus {
    Active, Finished
}

type Listener<T> = (items: T[]) => void;

class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) { }
}

//* State Class (we made this class so if we got different states , like for projects, users and so on...)
class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

//* ProjectState Class (Class for managing the state of the application using singelton pattern (only one instance), the instance inside ProjectInput Class to take the input's data , and the instance inside ProjectList Class to give it the data to render it)
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) return this.instance;
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        // const newProject = {
        //     id: Math.random().toString(),
        //     title: title,
        //     description: description,
        //     numOfPeople: numOfPeople
        // }
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState: ProjectState = ProjectState.getInstance();

//* ProjectItem Class (responsible for rendering a single project item, instance used inside ProjectList Class)
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

//* ProjectList Class (Class for rendering the data in lists)
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

//* ProjectInput Class (class for getting the data from inputs and validate it)
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler) //! We can do this.submitHandler.bind(this) here instead of Autobind decorator or just make submitHandler as an arrow function
    }

    renderContent(): void { }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert("Invalid input, please try again...");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
        // this.formElement.reset();
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);

            this.clearInputs();
        }
    }
}

const prjInput = new ProjectInput();
const activeProj = new ProjectList('active');
const finishedProj = new ProjectList('finished');

