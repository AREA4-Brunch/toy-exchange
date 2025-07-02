import express from 'express';
import { ILoginExpressController } from '../../../../infrastructure/ports/controllers/login.express.controller.interface';

export interface ILoginExpressControllerFactory {
    create(res: express.Response): ILoginExpressController;
}
