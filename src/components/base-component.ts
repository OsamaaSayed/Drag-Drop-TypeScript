namespace App {

    //* abstract Component Class(renders the ui) (This is the base clase that other classes [ProjectList,ProjectInput] inherits it to not duplicate the code , and we don't need to make instance from this class so we make it as an abstract class)
   export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

}