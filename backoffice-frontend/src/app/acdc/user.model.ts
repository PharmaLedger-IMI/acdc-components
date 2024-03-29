
/**
 * Frontend user session object.
 */
export class User {
    userid: string | undefined; // UUID
    email: string | undefined;
    password: string | undefined; // filled only during login form handling. undefined during session
    token: string | undefined; // acdc-backoffice-backend JWT token
    //roles: Role[];
    //organization: Organization;
    //organizationId: string;
    //roleId: string;
}
