"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var dotenv = require("dotenv");
var oracledbImport = require("oracledb");
var oracledb = (_a = oracledbImport.default) !== null && _a !== void 0 ? _a : oracledbImport;
for (var _i = 0, _b = [".env", "../../.env"]; _i < _b.length; _i++) {
    var envPath = _b[_i];
    if ((0, node_fs_1.existsSync)(envPath)) {
        dotenv.config({ path: envPath });
        break;
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, sqlPath, sql, statements, i, statement, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 11]);
                    return [4 /*yield*/, oracledb.getConnection({
                            user: process.env.ORACLE_USER,
                            password: process.env.ORACLE_PASSWORD,
                            connectString: process.env.ORACLE_CONNECT_STRING,
                        })];
                case 1:
                    connection = _a.sent();
                    sqlPath = [
                        "./database/TRAIN_INFO.sql",
                        "./src/Scripts/database/TRAIN_INFO.sql",
                    ].find(function (p) { return (0, node_fs_1.existsSync)(p); });
                    if (!sqlPath) {
                        throw new Error("TRAIN_INFO.sql not found. Run from server or src/Scripts.");
                    }
                    sql = (0, node_fs_1.readFileSync)(sqlPath, "utf8");
                    statements = sql
                        .split(/;\r?\n/)
                        .map(function (s) { return s.trim(); })
                        .filter(function (s) { return s.startsWith("Insert into"); });
                    console.log("Found ".concat(statements.length, " INSERT statements"));
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < statements.length)) return [3 /*break*/, 6];
                    statement = statements[i];
                    return [4 /*yield*/, connection.execute(statement)];
                case 3:
                    _a.sent();
                    if (!((i + 1) % 500 === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, connection.commit()];
                case 4:
                    _a.sent();
                    console.log("Inserted ".concat(i + 1, " rows"));
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [4 /*yield*/, connection.commit()];
                case 7:
                    _a.sent();
                    console.log("✅ TRAIN_INFO data imported successfully");
                    return [3 /*break*/, 11];
                case 8:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, (connection === null || connection === void 0 ? void 0 : connection.close())];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
