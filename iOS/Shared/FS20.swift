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

func executeFS20CommandOnce(url: String, hc1: Int, hc2: Int, adr: Int, bef: UInt8, erw: UInt8, completionHandler: (NSError? -> Void)) -> Bool {
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
    
    let postData: [UInt8] =
    [
        0x2,
        0x6,
        0xF1,
        UInt8(houseCode1Hex!),
        UInt8(houseCode2Hex!),
        UInt8(channelCodeHex!),
        bef,
        erw
    ]
    
    request.HTTPBody = NSData(bytes: postData, length: postData.count)
    
    session.dataTaskWithRequest(request) {
        completionHandler($2 as NSError?)
    }.resume()

    return true
}