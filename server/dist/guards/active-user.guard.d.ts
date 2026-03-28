import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from '../user/user.service';
export declare class ActiveUserGuard implements CanActivate {
    private readonly userService;
    constructor(userService: UserService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
