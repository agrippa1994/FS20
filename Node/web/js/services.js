angular.module("services", [])

.factory("Notification", function() {
    return function(caption, content, style, keepOpen) {
        style = style || "success";
        keepOpen = keepOpen || false;
        
        $.Notify({ caption: caption, content: content, type: style, keepOpen: keepOpen });
    };
})

.factory("FS20", function($resource) {
    return {
        rooms: $resource("/api/rooms"),
        
        room: function(roomID) {
            return $resource("/api/rooms/:roomID", { roomID: roomID });   
        },
        
        devices: function() {
            return $resource("/api/devices");
        },
        
        device: function(deviceID) {
            return $resource("/api/devices/:deviceID", { deviceID: deviceID }, {
                "update": { method: "PUT" }
            });   
        },
        
        setState: function(roomID, deviceID, state) {
            return $resource("/api/device/:device_id/:command", null, { getWithTimeout: { method: "GET", timeout: 1000  }}).getWithTimeout({
                    device_id: deviceID,
                    command: (state ? "enable" : "disable")
                }
            );
        },
        
        isValidFS20Code: function(code) {
            var c = parseInt(code);
            if(isNaN(c))
                return false;
                
            return c >= 0x00 && c <= 0xFF;
        },
        
        germanErrorDescription: function(code) {
            return {
                1000: "Illegaler JSON Code",
                1001: "Datenbank-Fehler",
                1002: "Illegaler FS20-Code",
                1003: "Die angegebene Ressource wurde nicht in der Datenbank gefunden",
                1004: "Fehlerhafte FS20 Ausführung",
                1005: "Unbekannter Befehl",
                1006: "Löschvorgang fehlgeschlagen"
            } [code] || "";
        }
    };
})
