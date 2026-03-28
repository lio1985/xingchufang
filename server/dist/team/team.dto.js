"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamStatisticsQueryDto = exports.TeamQueryDto = exports.UpdateTeamMemberRoleDto = exports.AddTeamMemberDto = exports.UpdateTeamDto = exports.CreateTeamDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTeamDto {
}
exports.CreateTeamDto = CreateTeamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "leaderId", void 0);
class UpdateTeamDto {
}
exports.UpdateTeamDto = UpdateTeamDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "leaderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTeamDto.prototype, "isActive", void 0);
class AddTeamMemberDto {
    constructor() {
        this.role = 'member';
    }
}
exports.AddTeamMemberDto = AddTeamMemberDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['leader', 'member']),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "role", void 0);
class UpdateTeamMemberRoleDto {
}
exports.UpdateTeamMemberRoleDto = UpdateTeamMemberRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(['leader', 'member']),
    __metadata("design:type", String)
], UpdateTeamMemberRoleDto.prototype, "role", void 0);
class TeamQueryDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.TeamQueryDto = TeamQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TeamQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TeamQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TeamQueryDto.prototype, "pageSize", void 0);
class TeamStatisticsQueryDto {
}
exports.TeamStatisticsQueryDto = TeamStatisticsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TeamStatisticsQueryDto.prototype, "teamId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TeamStatisticsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TeamStatisticsQueryDto.prototype, "endDate", void 0);
//# sourceMappingURL=team.dto.js.map