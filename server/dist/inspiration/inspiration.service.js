"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspirationService = void 0;
const common_1 = require("@nestjs/common");
let InspirationService = class InspirationService {
    constructor() {
        this.inspirations = [
            {
                id: '1',
                content: '尝试拍摄"一日三餐"的系列视频，展示不同地区的美食文化',
                createdAt: '2025-01-10T08:30:00Z',
                updatedAt: '2025-01-10T08:30:00Z'
            },
            {
                id: '2',
                content: '结合最近的"国潮"趋势，做一期传统文化与现代生活结合的内容',
                createdAt: '2025-01-09T14:20:00Z',
                updatedAt: '2025-01-09T14:20:00Z'
            }
        ];
    }
    findAll() {
        return [...this.inspirations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    findOne(id) {
        return this.inspirations.find(ins => ins.id === id);
    }
    create(createInspirationDto) {
        const now = new Date().toISOString();
        const newInspiration = {
            id: Date.now().toString(),
            content: createInspirationDto.content || '',
            images: createInspirationDto.images || [],
            createdAt: now,
            updatedAt: now
        };
        this.inspirations.unshift(newInspiration);
        return newInspiration;
    }
    delete(id) {
        const index = this.inspirations.findIndex(ins => ins.id === id);
        if (index !== -1) {
            this.inspirations.splice(index, 1);
            return true;
        }
        return false;
    }
};
exports.InspirationService = InspirationService;
exports.InspirationService = InspirationService = __decorate([
    (0, common_1.Injectable)()
], InspirationService);
//# sourceMappingURL=inspiration.service.js.map