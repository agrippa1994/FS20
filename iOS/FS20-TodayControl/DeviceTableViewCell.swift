//
//  ChannelTableViewCell.swift
//  FS20
//
//  Created by Mani on 02.02.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

enum DeviceTableViewActionType: Int {
    case Enable
    case Disable
}

@objc protocol DeviceTableViewCellDelegate {
    func deviceTableViewCell(view: DeviceTableViewCell, withAction action: Int)
}

class DeviceTableViewCell: UITableViewCell {
    weak var delegate: DeviceTableViewCellDelegate?
    
    @IBOutlet var deviceLabel: UILabel!
    @IBOutlet var houseLabel: UILabel!
    @IBOutlet var codeLabel: UILabel!
    @IBOutlet var enableButton: UIButton!
    @IBOutlet var disableButton: UIButton!
    
    
    @IBAction func onButton(sender: UIButton) {
        var action: DeviceTableViewActionType!
        
        switch sender {
        case enableButton:
            action = .Enable
        case disableButton:
            action = .Disable
        default:
            break
        }
        
        self.delegate?.deviceTableViewCell(self, withAction: action.rawValue)
    }
    
}
