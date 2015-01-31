//
//  FS20.swift
//  FS20
//
//  Created by Mani on 25.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

func isHouseCode(var hc: Int) -> Bool {
    if hc < 1111 || hc > 4444 {
        return false
    }
    
    for var i = 1; i <= 4; i++, hc = hc / 10 {
        if hc % 10 < 1 || hc % 10 > 4 {
            return false
        }
    }
    
    return true
}

func convertToHouseCodeHex(hc: Int) -> UInt8? {
    if !isHouseCode(hc) {
        return nil
    }
    
    
    for var i: Int = 1111, hex: UInt8 = 0x00; i <= 4444; i++ {
        if !isHouseCode(i) {
            continue
        }
        
        if hc == i {
            return hex
        }
        
        hex++
    }
    
    return nil
}

func executeFS20CommandOnce(url: String, hc1: Int, hc2: Int, adr: Int, bef: Byte, erw: Byte, completionHandler: ([Byte]? -> Void)) -> Bool {
    var request = NSMutableURLRequest(URL: NSURL(string: url)!)
    var session = NSURLSession.sharedSession()
    
    request.HTTPMethod = "POST"
    request.timeoutInterval = 2.5
    
    let houseCode1Hex = convertToHouseCodeHex(hc1)
    let houseCode2Hex = convertToHouseCodeHex(hc2)
    let channelCodeHex = convertToHouseCodeHex(adr)
    
    if houseCode1Hex == nil || houseCode2Hex == nil || channelCodeHex == nil {
        return false
    }
    
    let postData: [Byte] =
    [
        0x2,
        0x6,
        0xF1,
        Byte(houseCode1Hex!),
        Byte(houseCode2Hex!),
        Byte(channelCodeHex!),
        bef,
        erw
    ]
    
    request.HTTPBody = NSData(bytes: postData, length: postData.count)
    
    var task = session.dataTaskWithRequest(request) { data, response, error -> Void in
        if error != nil {
            NSLog("Error in %@ (%@)", __FUNCTION__, error)
            return completionHandler(nil)
        }
        
        if let response = NSJSONSerialization.JSONObjectWithData(data, options: .MutableLeaves, error: nil) as? [NSNumber] {
   
            var typeSafeResponse = Array<UInt8>()
            for i in response {
                let intValue = i.intValue
                if intValue < 0 || intValue > 0xFF {
                    return completionHandler(nil)
                } else {
                    typeSafeResponse.append(UInt8(intValue))
                }
            }

            return completionHandler(typeSafeResponse)
        }
        
        return completionHandler(nil)
    }
    
    task.resume()
    return true
}