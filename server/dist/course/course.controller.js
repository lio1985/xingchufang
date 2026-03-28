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
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const course_service_1 = require("./course.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const admin_guard_1 = require("../guards/admin.guard");
let CourseController = class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }
    async getCategories() {
        return this.courseService.getCategories();
    }
    async getList(categoryId, contentType, status, keyword, page = '1', limit = '20', req) {
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
        return this.courseService.getCourses({
            categoryId,
            contentType,
            status,
            keyword,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            userId: req.user?.id,
            isAdmin,
        });
    }
    async getDetail(id, req) {
        return this.courseService.getCourseDetail(id, req.user?.id);
    }
    async create(dto, req) {
        return this.courseService.createCourse(dto, req.user.id);
    }
    async update(id, dto, req) {
        return this.courseService.updateCourse(id, dto, req.user.id);
    }
    async delete(id) {
        return this.courseService.deleteCourse(id);
    }
    async publish(id) {
        return this.courseService.publishCourse(id);
    }
    async archive(id) {
        return this.courseService.archiveCourse(id);
    }
    async uploadFile(file) {
        console.log('上传课程文件：', file?.originalname);
        console.log('文件类型：', file?.mimetype);
        console.log('文件大小：', file?.size);
        if (!file) {
            return { code: 400, msg: '请上传文件' };
        }
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return { code: 400, msg: '不支持的文件类型，仅支持 PDF、PPT、Word、图片' };
        }
        let contentType = course_service_1.ContentType.OTHER;
        if (file.mimetype === 'application/pdf') {
            contentType = course_service_1.ContentType.PDF;
        }
        else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) {
            contentType = course_service_1.ContentType.PPT;
        }
        else if (file.mimetype.startsWith('image/')) {
            contentType = course_service_1.ContentType.IMAGE_TEXT;
        }
        const mockUrl = `https://example.com/courses/${Date.now()}_${file.originalname}`;
        return {
            code: 200,
            msg: 'success',
            data: {
                url: mockUrl,
                filename: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                contentType,
            },
        };
    }
    async updateLearning(id, dto, req) {
        return this.courseService.updateLearning(id, req.user.id, dto);
    }
    async toggleFavorite(id, req) {
        return this.courseService.toggleFavorite(id, req.user.id);
    }
    async getFavorites(page = '1', limit = '20', req) {
        return this.courseService.getFavoriteCourses(req.user.id, parseInt(page) || 1, parseInt(limit) || 20);
    }
    async getLearnings(page = '1', limit = '20', req) {
        return this.courseService.getLearningHistory(req.user.id, parseInt(page) || 1, parseInt(limit) || 20);
    }
    async getStatistics(req) {
        return this.courseService.getStatistics(req.user?.id);
    }
    async getRecommended(limit = '5', req) {
        return this.courseService.getRecommendedCourses(req.user?.id, parseInt(limit) || 5);
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('contentType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('keyword')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)(':id/learning'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateLearning", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Get)('user/favorites'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)('user/learnings'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getLearnings", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('recommend/list'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getRecommended", null);
exports.CourseController = CourseController = __decorate([
    (0, common_1.Controller)('course'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
//# sourceMappingURL=course.controller.js.map