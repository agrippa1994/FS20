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