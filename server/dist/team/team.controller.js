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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const team_service_1 = require("./team.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let TeamController = class TeamController {
    constructor(teamService) {
        this.teamService = teamService;
    }
    async createTeam(req, dto) {
        return this.teamService.createTeam(req.user.id, dto);
    }
    async getAllTeams() {
        return this.teamService.getAllTeams();
    }
    async getMyTeam(req) {
        return this.teamService.getUserTeam(req.user.id);
    }
    async getMyTeamAlt(req) {
        return this.teamService.getUserTeam(req.user.id);
    }
    async getMyTeamMembers(req) {
        return this.teamService.getTeamMembers(req.user.id);
    }
    async getMyTeamStatistics(req) {
        return this.teamService.getTeamStatistics(req.user.id);
    }
    async getAvailableUsers(req, search) {
        return this.teamService.getAvailableUsers(req.user.id, search);
    }
    async getTeam(id) {
        return this.teamService.getTeam(id);
    }
    async updateTeam(req, id, dto) {
        return this.teamService.updateTeam(req.user.id, id, dto);
    }
    async addMember(req, id, memberId) {
        return this.teamService.addMember(req.user.id, id, memberId);
    }
    async removeMember(req, id, memberId) {
        return this.teamService.removeMember(req.user.id, id, memberId);
    }
    async transferLeadership(req, id, newLeaderId) {
        return this.teamService.transferLeadership(req.user.id, id, newLeaderId);
    }
    async getMyTeamTasks(req) {
        return this.teamService.getTeamTasks(req.user.id);
    }
    async createTeamTask(req, body) {
        return this.teamService.createTeamTask(req.user.id, body);
    }
    async updateTeamTask(req, taskId, body) {
        return this.teamService.updateTeamTask(req.user.id, taskId, body);
    }
    async deleteTeamTask(req, taskId) {
        return this.teamService.deleteTeamTask(req.user.id, taskId);
    }
    async getMyTeamAnnouncements(req) {
        return this.teamService.getTeamAnnouncements(req.user.id);
    }
    async createTeamAnnouncement(req, body) {
        return this.teamService.createTeamAnnouncement(req.user.id, body);
    }
    async markAnnouncementRead(req, announcementId) {
        return this.teamService.markAnnouncementRead(req.user.id, announcementId);
    }
    async getMyTeamChatMessages(req) {
        return this.teamService.getTeamChatMessages(req.user.id);
    }
    async sendTeamChatMessage(req, body) {
        return this.teamService.sendTeamChatMessage(req.user.id, body);
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeam", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAllTeams", null);
__decorate([
    (0, common_1.Get)('my-team'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeam", null);
__decorate([
    (0, common_1.Get)('my/team'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamAlt", null);
__decorate([
    (0, common_1.Get)('my/members'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamMembers", null);
__decorate([
    (0, common_1.Get)('my/statistics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamStatistics", null);
__decorate([
    (0, common_1.Get)('available-users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAvailableUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateTeam", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/transfer-leadership'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('newLeaderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "transferLeadership", null);
__decorate([
    (0, common_1.Get)('my/tasks'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamTasks", null);
__decorate([
    (0, common_1.Post)('my/tasks'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeamTask", null);
__decorate([
    (0, common_1.Put)('my/tasks/:taskId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateTeamTask", null);
__decorate([
    (0, common_1.Delete)('my/tasks/:taskId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "deleteTeamTask", null);
__decorate([
    (0, common_1.Get)('my/announcements'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamAnnouncements", null);
__decorate([
    (0, common_1.Post)('my/announcements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeamAnnouncement", null);
__decorate([
    (0, common_1.Post)('my/announcements/:announcementId/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('announcementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "markAnnouncementRead", null);
__decorate([
    (0, common_1.Get)('my/chat-messages'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeamChatMessages", null);
__decorate([
    (0, common_1.Post)('my/chat-messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "sendTeamChatMessage", null);
exports.TeamController = TeamController = __decorate([
    (0, common_1.Controller)('teams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map