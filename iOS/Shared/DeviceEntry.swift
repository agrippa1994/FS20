//
//  DeviceEntry.swift
//  FS20
//
//  Created by Mani on 26.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation
import CoreData

@objc(DeviceEntry)
class DeviceEntry: NSManagedObject {

    @NSManaged var adr: NSNumber
    @NSManaged var house: HouseEntry

}
