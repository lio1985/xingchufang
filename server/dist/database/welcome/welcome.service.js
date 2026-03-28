"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../storage/database/supabase-client");
let WelcomeService = class WelcomeService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async getAll() {
        const { data, error } = await this.client
            .from('welcome_messages')
            .select('*')
            .order('order', { ascending: true });
        if (error) {
            console.error('获取欢迎消息失败:', error);
            return [];
        }
        return data || [];
    }
    async create(body) {
        const { data, error } = await this.client
            .from('welcome_messages')
            .insert({
            title: body.title,
            content: body.content,
            image_url: body.imageUrl,
            order: body.order,
            is_active: 'true',
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async update(id, body) {
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.content !== undefined)
            updateData.content = body.content;
        if (body.imageUrl !== undefined)
            updateData.image_url = body.imageUrl;
        if (body.order !== undefined)
            updateData.order = body.order;
        if (body.isActive !== undefined)
            updateData.is_active = body.isActive;
        const { data, error } = await this.client
            .from('welcome_messages')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async delete(id) {
        const { data, error } = await this.client
            .from('welcome_messages')
            .update({ is_active: 'false' })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.WelcomeService = WelcomeService;
exports.WelcomeService = WelcomeService = __decorate([
    (0, common_1.Injectable)()
], WelcomeService);
//# sourceMappingURL=welcome.service.js.map