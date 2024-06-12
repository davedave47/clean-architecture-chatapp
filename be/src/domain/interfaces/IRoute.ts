export default interface Route {
    path: string,
    method: string,
    handler: Function,
    middlewares: Function[]
}