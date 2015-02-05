//
//  ChannelTableViewCell.swift
//  FS20
//
//  Created by Mani on 31.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

enum ChannelTableViewActionType: Int {
    case Enable
    case Disable
    case Toggle
}

@objc protocol ChannelTableViewCellDelegate {
    func channelTableView(cell: ChannelTableViewCell, withAction action: Int)
}

class ChannelTableViewCell: StyledTableViewCell {
    weak var delegate: ChannelTableViewCellDelegate?
    
    @IBOutlet var title: UILabel!
    @IBOutlet var subtitle: UILabel!
    
    @IBOutlet var enableButton: UIButton!
    @IBOutlet var disableButton: UIButton!
    @IBOutlet var toggleButton: UIButton!
    
    @IBAction func onButtonClicked(sender: UIButton) {
        var type: ChannelTableViewActionType?
        
        switch sender {
        case enableButton:  type = .Enable
        case disableButton: type = .Disable
        case toggleButton:  type = .Toggle
        default:
            break
        }
        
        if type != nil {
            delegate?.channelTableView(self, withAction: type!.rawValue)
        }
    }
}
