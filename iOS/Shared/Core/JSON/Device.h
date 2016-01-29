//
//  Device.h
//  FS20
//
//  Created by Manuel Stampfl on 29.01.16.
//  Copyright © 2016 Mani. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <JSONModel/JSONModelLib.h>
#import "SwitchResult.h"

@protocol Device
@end

@interface Device : JSONModel

@property (assign, nonatomic) int id;
@property (assign, nonatomic) NSString * _Nonnull name;
@property (assign, nonatomic) int code;
@property (assign, nonatomic) int roomId;

- (void)setDeviceState:(BOOL) state atHost: (NSString * _Nonnull) host withCompletion: (void (^ _Nullable)(JSONModelError * _Nullable, SwitchResult * _Nullable))completion;

@end
