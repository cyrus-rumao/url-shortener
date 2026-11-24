import type {
    Request,
    Response,
    NextFunction,
    RequestHandler
} from "express";

type RouteController = (
    req: Request,
    res: Response,
    next: NextFunction
) => unknown | Promise<unknown>;

export const routeHandler = (
    route: string,
    controller: RouteController
): RequestHandler => {
    return (req, res, next) => {
        res.locals.route = route;

        Promise.resolve(
            controller(req, res, next)
        ).catch(next);
    };
};