//
//  DeviceEntry.h
//  FS20
//
//  Created by Mani on 31.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>

@class HouseEntry;

@interface DeviceEntry : NSManagedObject

@property (nonatomic, retain) NSNumber * adr;
@property (nonatomic, retain) NSString * name;
@property (nonatomic, retain) NSNumber * showInNC;
@property (nonatomic, retain) HouseEntry *house;

@end
