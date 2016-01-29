//
//  Room.m
//  FS20
//
//  Created by Manuel Stampfl on 29.01.16.
//  Copyright © 2016 Mani. All rights reserved.
//

#import "Room.h"

@implementation Room

+ (void)fetchDataFromHost:(NSString * _Nonnull)host withCompletion: (void (^ _Nonnull)(JSONModelError * _Nullable, NSArray<Room * > * _Nullable))block {
    [JSONHTTPClient getJSONFromURLWithString:[NSString stringWithFormat:@"http://%@/api/rooms", host]
                                  completion:^(id json, JSONModelError *err) {
                                      if(err) {
                                          NSLog(@"JSON error: %@", err);
                                          return block(err, nil);
                                      }
                                      
                                      NSArray<NSDictionary *> *jsonData = json;
                                      if([jsonData count] == 0)
                                          return block(nil, [NSArray array]);
                                      
                                      NSMutableArray<Room *> *rooms = [NSMutableArray arrayWithCapacity:[jsonData count]];
                                      for(int i = 0; i < [jsonData count]; i++)
                                          [rooms setObject:[[Room alloc] initWithDictionary:[jsonData objectAtIndex:i] error:nil] atIndexedSubscript:i];
                                      
                                      block(nil, rooms);
                                  }];
}

@end
