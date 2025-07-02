/**
 * In clean architecture, the view is a humble object and presenter is testable
 * part, and in the diagram the two depend only on the simple ViewModel data
 * structure.
 * Instead of just creating the ViewModel as DS, in the view as a field, and
 * letting the presenter change its values, and then must call render externally
 * I prefer to apply the True Humble Object pattern as its only more elegant and
 * powerful in my humble ;) opinion.
 */

/**
 * Humble Object's interface in the True Humble Object pattern between view
 * and presenter.
 */
export interface ILoginView {
    // each of these are independent view scenarios with their own sets of props
    setSuccessData(data: LoginSuccessViewModel): void;
    setUserNotFoundData(data: LoginNotFoundViewModel): void;
    setIncorrectPasswordData(data: LoginIncorrectPasswordViewModel): void;
    setForbiddenData(data: LoginForbiddenViewModel): void;
}

export class LoginSuccessViewModel {
    constructor(public token: string) {}
}

export class LoginNotFoundViewModel {
    constructor(public message: string) {}
}

export class LoginIncorrectPasswordViewModel {
    constructor(public message: string) {}
}

export class LoginForbiddenViewModel {
    constructor(public message: string) {}
}
