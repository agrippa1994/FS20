//
//  Device.m
//  FS20
//
//  Created by Manuel Stampfl on 29.01.16.
//  Copyright © 2016 Mani. All rights reserved.
//

#import "Device.h"

@implementation Device

- (void)setDeviceState:(BOOL) state atHost: (NSString * _Nonnull) host withCompletion: (void (^ _Nullable)(JSONModelError * _Nullable, SwitchResult * _Nullable))completion; {
    NSString *textState = state == YES ? @"enable" : @"disable";
    [JSONHTTPClient getJSONFromURLWithString:[NSString stringWithFormat:@"http://%@/api/device/%d/%@", host, self.roomId, textState]
                                  completion:^(id json, JSONModelError *err) {
                                      if(err) {
                                          if(completion != nil)
                                              completion(err, nil);
                                          return;
                                      }
                                      
                                      if(completion != nil)
                                          completion(nil, [[SwitchResult alloc] initWithDictionary:json error:nil]);
                                  }];
}

@end
