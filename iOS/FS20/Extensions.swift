//
//  Extensions.swift
//  FS20
//
//  Created by Mani on 05.02.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

extension UIColor {
    convenience init(fromHex hex:UInt) {
        
        let alpha = CGFloat((hex >> 24) & 0xFF) / 255.0
        let red = CGFloat((hex >> 16) & 0xFF) / 255.0
        let green = CGFloat((hex >> 8) & 0xFF) / 255.0
        let blue = CGFloat(hex & 0xFF) / 255.0
        
        self.init(red: red, green: green, blue: blue, alpha: alpha)
    }
}
