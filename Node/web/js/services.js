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
        all: $resource("/api"),
        
        rooms: $resource("/api/room"),
        
        room: function(roomID) {
            return $resource("/api/room/:roomID", { roomID: roomID });   
        },
        
        devices: function(roomID) {
            return $resource("/api/room/:roomID/device", { roomID: roomID });
        },
        
        device: function(roomID, deviceID) {
            return $resource("/api/room/:roomID/device/:deviceID", { roomID: roomID, deviceID: deviceID });   
        },
        
        setState: function(device, state) {
            return $resource("/api/room/:room_id/device/:device_id/:command", null, { getWithTimeout: { method: "GET", timeout: 1000  }}).getWithTimeout({
                    room_id: device.room_id,
                    device_id: device.id,
                    command: (state ? "enable" : "disable")
                }
            );
        },
        
        isValidFS20Code: function(code) {
            var c = parseInt(code);
            if(isNaN(c))
                return false;

            if(c < 1111 || c > 4444)
                return false;

            for(var i = 1; i <= 4; i++, c = Math.floor(c / 10))
                if(c % 10 < 1 || c % 10 > 4)
                    return false;

            return true;
        },
        
        convertFS20Code: function(code) {
            if(!fs20.isValidCode(code))
                return -1;

            for(var i = 1111, hex = 0x00; i<=4444; i++) {
                if(!fs20.isValidCode(i))
                    continue;

                if(code == i)
                    return hex;

                hex++;
            }
            return -1;
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
