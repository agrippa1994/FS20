//
//  HouseEntry.h
//  FS20
//
//  Created by Mani on 31.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>

@class DeviceEntry;

@interface HouseEntry : NSManagedObject

@property (nonatomic, retain) NSNumber * hc1;
@property (nonatomic, retain) NSNumber * hc2;
@property (nonatomic, retain) NSString * host;
@property (nonatomic, retain) NSString * name;
@property (nonatomic, retain) NSSet *devices;
@end

@interface HouseEntry (CoreDataGeneratedAccessors)

- (void)addDevicesObject:(DeviceEntry *)value;
- (void)removeDevicesObject:(DeviceEntry *)value;
- (void)addDevices:(NSSet *)values;
- (void)removeDevices:(NSSet *)values;

@end
