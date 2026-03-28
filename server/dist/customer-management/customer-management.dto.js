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
exports.CustomerQueryDto = exports.CreateFollowUpDto = exports.UpdateCustomerDto = exports.CreateCustomerDto = exports.CustomerSource = exports.OrderBelonging = exports.CustomerType = exports.OrderStatus = exports.CustomerStatus = void 0;
const class_validator_1 = require("class-validator");
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["NORMAL"] = "normal";
    CustomerStatus["AT_RISK"] = "at_risk";
    CustomerStatus["LOST"] = "lost";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["IN_PROGRESS"] = "in_progress";
    OrderStatus["COMPLETED"] = "completed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var CustomerType;
(function (CustomerType) {
    CustomerType["NEWBIE"] = "\u9910\u996E\u5C0F\u767D\u521B\u4E1A";
    CustomerType["OWNER"] = "\u9910\u996E\u8001\u677F";
    CustomerType["OTHER"] = "\u5176\u4ED6";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
var OrderBelonging;
(function (OrderBelonging) {
    OrderBelonging["WAREHOUSE"] = "\u661F\u53A8\u623F\u603B\u4ED3";
    OrderBelonging["BAGUOCheng"] = "\u5DF4\u56FD\u57CE\u5E97";
    OrderBelonging["WULIDIAN"] = "\u4E94\u91CC\u5E97\u8463\u5BB6\u6EAA\u5E97";
})(OrderBelonging || (exports.OrderBelonging = OrderBelonging = {}));
var CustomerSource;
(function (CustomerSource) {
    CustomerSource["DOUYIN"] = "\u6296\u97F3";
    CustomerSource["XIAOHONGSHU"] = "\u5C0F\u7EA2\u4E66";
    CustomerSource["REFERRAL"] = "\u8F6C\u4ECB\u7ECD";
    CustomerSource["OFFLINE"] = "\u7EBF\u4E0B";
    CustomerSource["OTHER"] = "\u5176\u4ED6";
})(CustomerSource || (exports.CustomerSource = CustomerSource = {}));
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "wechat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "xiaohongshu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "douyin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCustomerDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerSource),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerType),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "requirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "estimatedAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "firstFollowUpAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "firstFollowUpContent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "firstFollowUpMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerStatus),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderBelonging),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "orderBelonging", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderStatus),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "orderStatus", void 0);
class UpdateCustomerDto {
}
exports.UpdateCustomerDto = UpdateCustomerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "wechat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "xiaohongshu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "douyin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCustomerDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerSource),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerType),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "requirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "estimatedAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerStatus),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderBelonging),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "orderBelonging", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderStatus),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "orderStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "statusChangeReason", void 0);
class CreateFollowUpDto {
}
exports.CreateFollowUpDto = CreateFollowUpDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "followUpTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "followUpMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "nextFollowUpPlan", void 0);
class CustomerQueryDto {
}
exports.CustomerQueryDto = CustomerQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerStatus),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerType),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderBelonging),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "orderBelonging", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderStatus),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "orderStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "orderBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerQueryDto.prototype, "order", void 0);
//# sourceMappingURL=customer-management.dto.js.map