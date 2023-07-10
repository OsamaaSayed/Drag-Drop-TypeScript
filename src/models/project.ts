export enum ProjectStatus {
    Active, Finished
}

//* Project Class to make an instance of it(using it as a type) (project instance that we add)
export class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }
}



