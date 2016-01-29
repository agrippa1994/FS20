//
//  SwitchResult.h
//  FS20
//
//  Created by Manuel Stampfl on 30.01.16.
//  Copyright © 2016 Mani. All rights reserved.
//

#import <JSONModel/JSONModel.h>
#import <JSONModel/JSONModelLib.h>

@interface SwitchResult : JSONModel

@property (assign, nonatomic) int code;
@property (assign, nonatomic) NSString * _Nonnull text;

@end
