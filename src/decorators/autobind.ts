namespace App {

    //* Autobind Decorator (Method Decorator) (This is a Decorator just to bind the this to any event handler method to make it refers to the object itself rather than to the formElement which got the event on)
    export function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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

}