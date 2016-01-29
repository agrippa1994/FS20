//
//  Room.h
//  FS20
//
//  Created by Manuel Stampfl on 29.01.16.
//  Copyright © 2016 Mani. All rights reserved.
//

#import "Device.h"
#import <UIKit/UIKit.h>
#import <JSONModel/JSONModelLib.h>


/*
 [{"id":1,"name":"Zimmer","code1":255,"code2":170,"createdAt":"2015-10-11T14:24:17.379Z","updatedAt":"2015-10-11T14:24:17.379Z","devices":[{"id":2,"name":"Licht","code":238,"createdAt":"2015-10-11T14:26:05.367Z","updatedAt":"2015-10-11T14:26:05.367Z","roomId":1},{"id":3,"name":"Schildkröte","code":221,"createdAt":"2015-10-11T14:26:22.329Z","updatedAt":"2015-10-11T14:26:22.329Z","roomId":1},{"id":1,"name":"Steckdose","code":255,"createdAt":"2015-10-11T14:25:50.137Z","updatedAt":"2015-10-11T14:25:50.137Z","roomId":1},{"id":4,"name":"Ventilator","code":204,"createdAt":"2015-10-11T14:26:48.456Z","updatedAt":"2015-10-11T14:26:48.456Z","roomId":1}]}]
 */


@interface Room : JSONModel

@property (assign, nonatomic) int id;
@property (assign, nonatomic) NSString * _Nonnull name ;
@property (assign, nonatomic) int code1;
@property (assign, nonatomic) int code2;
@property (assign, nonatomic) NSArray<Device> * _Nonnull devices;

+ (void)fetchDataFromHost:(NSString * _Nonnull)host withCompletion: (void (^ _Nonnull)(JSONModelError * _Nullable, NSArray<Room * > * _Nullable))block;

@end
