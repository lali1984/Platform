"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUtils = exports.UserDomainEvent = exports.DomainEvent = exports.AggregateRoot = exports.ValueObject = exports.Entity = void 0;
var entity_base_1 = require("./entity.base");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return entity_base_1.Entity; } });
Object.defineProperty(exports, "ValueObject", { enumerable: true, get: function () { return entity_base_1.ValueObject; } });
var aggregate_root_base_1 = require("./aggregate-root.base");
Object.defineProperty(exports, "AggregateRoot", { enumerable: true, get: function () { return aggregate_root_base_1.AggregateRoot; } });
var domain_event_base_1 = require("./domain-event.base");
Object.defineProperty(exports, "DomainEvent", { enumerable: true, get: function () { return domain_event_base_1.DomainEvent; } });
Object.defineProperty(exports, "UserDomainEvent", { enumerable: true, get: function () { return domain_event_base_1.UserDomainEvent; } });
Object.defineProperty(exports, "EventUtils", { enumerable: true, get: function () { return domain_event_base_1.EventUtils; } });
//# sourceMappingURL=index.js.map