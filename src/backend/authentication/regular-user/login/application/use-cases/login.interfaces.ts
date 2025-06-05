export interface ILoginInput {
    email: string;
    password: string;
}

export interface ILoginOutput {
    token: string;
}

export interface ILoginUseCase {
    execute(input: ILoginInput): ILoginOutput;
}

export interface IUserRepoDto {
    email: string;
    password: string;
    roles: string[];
}

export interface IRegularUserRepository {
    find(criteria: Partial<IUserRepoDto>): any;
}

// export interface IUserMapper {
//     toRepoDto(user: ): any;
//     toEntity(userDto: any): IUserRepoDto;
// }
