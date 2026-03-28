"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../storage/database/supabase-client");
let ProductService = class ProductService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async findAll() {
        const { data, error } = await this.client
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.client
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async create(data) {
        const { data: result, error } = await this.client
            .from('products')
            .insert(data)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return result;
    }
    async update(id, data) {
        const { data: result, error } = await this.client
            .from('products')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return result;
    }
    async delete(id) {
        const { error } = await this.client
            .from('products')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)()
], ProductService);
//# sourceMappingURL=product.service.js.map