import { Router } from 'express';

export interface IRouterConf {
    path: string;
    router: Router;
}

export abstract class RouterRoot {
    public mount(root: Router): void {
        this.getRouters().forEach(({ path, router }) => root.use(path, router));
    }

    protected abstract getRouters(): IRouterConf[];
}
