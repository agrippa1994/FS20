//
//  ChannelTableViewCell.swift
//  FS20
//
//  Created by Mani on 31.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

@objc protocol ChannelTableViewCellDelegate {
    func channelTableViewDidEnableButtonClicked(cell: ChannelTableViewCell)
    func channelTableViewDidDisableButtonClicked(cell: ChannelTableViewCell)
    func channelTableViewDidToggleButtonClicked(cell: ChannelTableViewCell)
}

class ChannelTableViewCell: UITableViewCell {
    weak var delegate: ChannelTableViewCellDelegate?
    
    @IBOutlet var title: UILabel!
    @IBOutlet var subtitle: UILabel!
    
    @IBOutlet var enableButton: UIButton!
    @IBOutlet var disableButton: UIButton!
    @IBOutlet var toggleButton: UIButton!
    
    @IBAction func onButtonClicked(sender: UIButton) {
        switch sender {
        case enableButton:
            delegate?.channelTableViewDidEnableButtonClicked(self)
        case disableButton:
            delegate?.channelTableViewDidDisableButtonClicked(self)
        case toggleButton:
            delegate?.channelTableViewDidToggleButtonClicked(self)
        default:
            break
        }
    }
}
