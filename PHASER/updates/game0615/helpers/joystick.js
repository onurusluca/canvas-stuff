!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).rexvirtualjoystickplugin=e();}(undefined,(function(){function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,(r=n.key,s=void 0,"symbol"==typeof(s=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var n=i.call(t,e||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return ("string"===e?String:Number)(t)}(r,"string"))?s:String(s)),n);}var r,s;}function i(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function n(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&s(t,e);}function r(t){return r=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},r(t)}function s(t,e){return s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},s(t,e)}function o(t,e){if(e&&("object"==typeof e||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}function u(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return !1}}();return function(){var i,n=r(t);if(e){var s=r(this).constructor;i=Reflect.construct(n,arguments,s);}else i=n.apply(this,arguments);return o(this,i)}}function h(){return h="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=r(t)););return t}(t,e);if(n){var s=Object.getOwnPropertyDescriptor(n,e);return s.get?s.get.call(arguments.length<3?t:i):s.value}},h.apply(this,arguments)}var a=Phaser.Input.Keyboard.Key,c=Phaser.Input.Keyboard.KeyCodes,l=function(){function e(i){t(this,e),this.cursorKeys={up:new a(i,c.UP),down:new a(i,c.DOWN),left:new a(i,c.LEFT),right:new a(i,c.RIGHT)},this.noKeyDown=!0;}return i(e,[{key:"shutdown",value:function(t){for(var e in this.cursorKeys)this.cursorKeys[e].destroy();this.cursorKeys=void 0;}},{key:"destroy",value:function(t){shutdown(t);}},{key:"createCursorKeys",value:function(){return this.cursorKeys}},{key:"setKeyState",value:function(t,e){var i=this.cursorKeys[t];return i.enabled?(e&&(this.noKeyDown=!1),i.isDown!==e&&(y.timeStamp=Date.now(),y.keyCode=i.keyCode,e?i.onDown(y):i.onUp(y)),this):this}},{key:"clearAllKeysState",value:function(){for(var t in this.noKeyDown=!0,this.cursorKeys)this.setKeyState(t,!1);return this}},{key:"getKeyState",value:function(t){return this.cursorKeys[t]}},{key:"upKeyDown",get:function(){return this.cursorKeys.up.isDown}},{key:"downKeyDown",get:function(){return this.cursorKeys.down.isDown}},{key:"leftKeyDown",get:function(){return this.cursorKeys.left.isDown}},{key:"rightKeyDown",get:function(){return this.cursorKeys.right.isDown}},{key:"anyKeyDown",get:function(){return !this.noKeyDown}}]),e}(),y={timeStamp:0,keyCode:0,altKey:!1,ctrlKey:!1,shiftKey:!1,metaKey:!1,location:0},f=180/Math.PI,v={"up&down":0,"left&right":1,"4dir":2,"8dir":3},d={},p=Phaser.Utils.Objects.GetValue,m=Phaser.Math.Distance.Between,b=Phaser.Math.Angle.Between,w=function(e){n(s,e);var r=u(s);function s(e,i){var n;return t(this,s),(n=r.call(this,e)).resetFromJSON(i),n}return i(s,[{key:"resetFromJSON",value:function(t){null==this.start&&(this.start={x:0,y:0}),null==this.end&&(this.end={x:0,y:0}),this._enable=void 0,this.setEnable(p(t,"enable",!0)),this.setMode(p(t,"dir","8dir")),this.setDistanceThreshold(p(t,"forceMin",16));var e=p(t,"start.x",null),i=p(t,"start.y",null),n=p(t,"end.x",null),r=p(t,"end.y",null);return this.setVector(e,i,n,r),this}},{key:"toJSON",value:function(){return {enable:this.enable,dir:this.dirMode,forceMin:this.forceMin,start:{x:this.start.x,y:this.start.y},end:{x:this.end.x,y:this.end.y}}}},{key:"setMode",value:function(t){return "string"==typeof t&&(t=v[t]),this.dirMode=t,this}},{key:"enable",get:function(){return this._enable},set:function(t){if(this._enable!==t)return t||this.clearVector(),this._enable=t,this}},{key:"setEnable",value:function(t){return void 0===t&&(t=!0),this.enable=t,this}},{key:"toggleEnable",value:function(){return this.setEnable(!this.enable),this}},{key:"setDistanceThreshold",value:function(t){return t<0&&(t=0),this.forceMin=t,this}},{key:"clearVector",value:function(){return this.start.x=0,this.start.y=0,this.end.x=0,this.end.y=0,this.clearAllKeysState(),this}},{key:"setVector",value:function(t,e,i,n){if(!this.enable)return this;if(null===t)return this.clearVector(),this;if(void 0===i&&(i=t,t=0,n=e,e=0),this.start.x=t,this.start.y=e,this.end.x=i,this.end.y=n,this.forceMin>0&&this.force<this.forceMin)return this.clearVector(),this;this.noKeyDown=!0;var r=function(t,e,i){switch(void 0===i?i={}:!0===i&&(i=d),i.left=!1,i.right=!1,i.up=!1,i.down=!1,t=(t+360)%360,e){case 0:t<180?i.down=!0:i.up=!0;break;case 1:t>90&&t<=270?i.left=!0:i.right=!0;break;case 2:t>45&&t<=135?i.down=!0:t>135&&t<=225?i.left=!0:t>225&&t<=315?i.up=!0:i.right=!0;break;case 3:t>22.5&&t<=67.5?(i.down=!0,i.right=!0):t>67.5&&t<=112.5?i.down=!0:t>112.5&&t<=157.5?(i.down=!0,i.left=!0):t>157.5&&t<=202.5?i.left=!0:t>202.5&&t<=247.5?(i.left=!0,i.up=!0):t>247.5&&t<=292.5?i.up=!0:t>292.5&&t<=337.5?(i.up=!0,i.right=!0):i.right=!0;}return i}(this.angle,this.dirMode,!0);for(var s in r)this.setKeyState(s,r[s]);return this}},{key:"forceX",get:function(){return this.end.x-this.start.x}},{key:"forceY",get:function(){return this.end.y-this.start.y}},{key:"force",get:function(){return m(this.start.x,this.start.y,this.end.x,this.end.y)}},{key:"rotation",get:function(){return b(this.start.x,this.start.y,this.end.x,this.end.y)}},{key:"angle",get:function(){return this.rotation*f}},{key:"octant",get:function(){var t=0;return this.rightKeyDown?t=this.downKeyDown?45:0:this.downKeyDown?t=this.leftKeyDown?135:90:this.leftKeyDown?t=this.upKeyDown?225:180:this.upKeyDown&&(t=this.rightKeyDown?315:270),t}}]),s}(l),g={setEventEmitter:function(t,e){return void 0===e&&(e=Phaser.Events.EventEmitter),this._privateEE=!0===t||void 0===t,this._eventEmitter=this._privateEE?new e:t,this},destroyEventEmitter:function(){return this._eventEmitter&&this._privateEE&&this._eventEmitter.shutdown(),this},getEventEmitter:function(){return this._eventEmitter},on:function(){return this._eventEmitter&&this._eventEmitter.on.apply(this._eventEmitter,arguments),this},once:function(){return this._eventEmitter&&this._eventEmitter.once.apply(this._eventEmitter,arguments),this},off:function(){return this._eventEmitter&&this._eventEmitter.off.apply(this._eventEmitter,arguments),this},emit:function(t){return this._eventEmitter&&t&&this._eventEmitter.emit.apply(this._eventEmitter,arguments),this},addListener:function(){return this._eventEmitter&&this._eventEmitter.addListener.apply(this._eventEmitter,arguments),this},removeListener:function(){return this._eventEmitter&&this._eventEmitter.removeListener.apply(this._eventEmitter,arguments),this},removeAllListeners:function(){return this._eventEmitter&&this._eventEmitter.removeAllListeners.apply(this._eventEmitter,arguments),this},listenerCount:function(){return this._eventEmitter?this._eventEmitter.listenerCount.apply(this._eventEmitter,arguments):0},listeners:function(){return this._eventEmitter?this._eventEmitter.listeners.apply(this._eventEmitter,arguments):[]},eventNames:function(){return this._eventEmitter?this._eventEmitter.eventNames.apply(this._eventEmitter,arguments):[]}},E={},k=Phaser.Utils.Objects.GetValue,K=Phaser.Geom.Circle,D=Phaser.Geom.Circle.Contains,_=function(e){n(o,e);var s=u(o);function o(e,i){var n;t(this,o);var r=e.scene;n=s.call(this,r,i);var u=k(i,"eventEmitter",void 0),h=k(i,"EventEmitterClass",void 0);return n.setEventEmitter(u,h),n.scene=r,n.mainCamera=r.sys.cameras.main,n.pointer=void 0,n.gameObject=e,n.radius=k(i,"radius",100),e.setInteractive(new K(e.displayOriginX,e.displayOriginY,n.radius),D),n.boot(),n}return i(o,[{key:"resetFromJSON",value:function(t){return h(r(o.prototype),"resetFromJSON",this).call(this,t),this.pointer=void 0,this}},{key:"toJSON",value:function(){var t=h(r(o.prototype),"toJSON",this).call(this);return t.radius=this.radius,t}},{key:"boot",value:function(){this.gameObject.on("pointerdown",this.onKeyDownStart,this),this.gameObject.on("pointerover",this.onKeyDownStart,this),this.scene.input.on("pointermove",this.onKeyDown,this),this.scene.input.on("pointerup",this.onKeyUp,this),this.gameObject.once("destroy",this.onParentDestroy,this);}},{key:"shutdown",value:function(t){this.scene&&(this.scene.input.off("pointermove",this.onKeyDown,this),this.scene.input.off("pointerup",this.onKeyUp,this),this.destroyEventEmitter(),this.scene=void 0,this.mainCamera=void 0,this.pointer=void 0,this.gameObject=void 0,h(r(o.prototype),"shutdown",this).call(this));}},{key:"destroy",value:function(t){this.shutdown(t);}},{key:"onParentDestroy",value:function(t,e){this.destroy(e);}},{key:"onKeyDownStart",value:function(t){t.isDown&&void 0===this.pointer&&(this.pointer=t,this.onKeyDown(t),this.emit("pointerdown",t));}},{key:"onKeyDown",value:function(t){if(this.pointer===t){var e=t.camera;if(e){var i=this.gameObject,n=this.end;e!==this.mainCamera?n=function(t,e,i,n){return void 0===n?n={}:!0===n&&(n=E),i.getWorldPoint(t,e,n),n}(t.x,t.y,e,n):(n.x=t.worldX,n.y=t.worldY);var r=i.x,s=i.y;0===i.scrollFactorX&&(r+=e.scrollX),0===i.scrollFactorY&&(s+=e.scrollY),this.setVector(r,s,n.x,n.y),this.emit("update");}}}},{key:"onKeyUp",value:function(t){this.pointer===t&&(this.pointer=void 0,this.clearVector(),this.emit("update"),this.emit("pointerup",t));}},{key:"forceUpdate",value:function(){var t=this.pointer;return t&&t.isDown?(this.onKeyDown(t),this):this}}]),o}(w);Object.assign(_.prototype,g);var O=Phaser.Utils.Objects.GetValue,x=function(){function e(i,n){t(this,e),void 0===n&&(n={});var r=O(n,"eventEmitter",void 0),s=O(n,"EventEmitterClass",void 0);this.setEventEmitter(r,s),n.eventEmitter=this.getEventEmitter(),this.scene=i,this.base=void 0,this.thumb=void 0,this.touchCursor=void 0,this.setRadius(O(n,"radius",100)),this.addBase(O(n,"base",void 0),n),this.addThumb(O(n,"thumb",void 0));var o=O(n,"x",0),u=O(n,"y",0);this.base.setPosition(o,u),this.thumb.setPosition(o,u),O(n,"fixed",!0)&&this.setScrollFactor(0),this.boot();}return i(e,[{key:"destroy",value:function(){this.destroyEventEmitter(),this.base.destroy(),this.thumb.destroy(),this.scene=void 0,this.base=void 0,this.thumb=void 0,this.touchCursor=void 0;}},{key:"createCursorKeys",value:function(){return this.touchCursor.createCursorKeys()}},{key:"forceX",get:function(){return this.touchCursor.forceX}},{key:"forceY",get:function(){return this.touchCursor.forceY}},{key:"force",get:function(){return this.touchCursor.force}},{key:"rotation",get:function(){return this.touchCursor.rotation}},{key:"angle",get:function(){return this.touchCursor.angle}},{key:"up",get:function(){return this.touchCursor.upKeyDown}},{key:"down",get:function(){return this.touchCursor.downKeyDown}},{key:"left",get:function(){return this.touchCursor.leftKeyDown}},{key:"right",get:function(){return this.touchCursor.rightKeyDown}},{key:"noKey",get:function(){return this.touchCursor.noKeyDown}},{key:"pointerX",get:function(){return this.touchCursor.end.x}},{key:"pointerY",get:function(){return this.touchCursor.end.y}},{key:"pointer",get:function(){return this.touchCursor.pointer}},{key:"setPosition",value:function(t,e){return this.x===t&&this.y===e||(this.x=t,this.y=e,this.forceUpdateThumb()),this}},{key:"x",get:function(){return this.base.x},set:function(t){this.x!==t&&(this.base.x=t,this.thumb.x=t);}},{key:"y",get:function(){return this.base.y},set:function(t){this.y!==t&&(this.base.y=t,this.thumb.y=t);}},{key:"setVisible",value:function(t){return this.visible=t,this}},{key:"toggleVisible",value:function(){return this.visible=!this.visible,this}},{key:"visible",get:function(){return this.base.visible},set:function(t){this.base.visible=t,this.thumb.visible=t;}},{key:"enable",get:function(){return this.touchCursor.enable},set:function(t){this.touchCursor.setEnable(t);}},{key:"setEnable",value:function(t){return void 0===t&&(t=!0),this.enable=t,this}},{key:"toggleEnable",value:function(){return this.setEnable(!this.enable),this}},{key:"setRadius",value:function(t){return this.radius=t,this}},{key:"addBase",value:function(t,e){return this.base&&this.base.destroy(),void 0===t&&(t=this.scene.add.circle(0,0,this.radius).setStrokeStyle(3,255)),void 0===e&&(e={}),e.eventEmitter=this.getEventEmitter(),this.touchCursor=new _(t,e),this.base=t,this}},{key:"addThumb",value:function(t){return this.thumb&&this.thumb.destroy(),void 0===t&&(t=this.scene.add.circle(0,0,40).setStrokeStyle(3,65280)),this.thumb=t,this}},{key:"setScrollFactor",value:function(t){return this.base.setScrollFactor(t),this.thumb.setScrollFactor(t),this}},{key:"boot",value:function(){this.on("update",this.update,this);}},{key:"update",value:function(){var t=this.touchCursor,e=this.base.x,i=this.base.y;if(t.anyKeyDown)if(t.force>this.radius){var n=t.rotation;e+=Math.cos(n)*this.radius,i+=Math.sin(n)*this.radius;}else e+=t.forceX,i+=t.forceY;return this.thumb.x=e,this.thumb.y=i,this}},{key:"forceUpdateThumb",value:function(){return this.touchCursor.forceUpdate(),this}}]),e}();return Object.assign(x.prototype,g),function(e){n(s,Phaser.Plugins.BasePlugin);var r=u(s);function s(e){return t(this,s),r.call(this,e)}return i(s,[{key:"start",value:function(){this.game.events.on("destroy",this.destroy,this);}},{key:"add",value:function(t,e){return new x(t,e)}}]),s}()}));
