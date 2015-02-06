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
}

@objc protocol ChannelTableViewCellDelegate {
    func channelTableView(cell: ChannelTableViewCell, withAction action: Int)
}

class ChannelTableViewCell: StyledTableViewCell {
    // MARK: - Variables
    weak var delegate: ChannelTableViewCellDelegate?
    
    // MARK: - Storyboard outlets
    @IBOutlet var title: UILabel!
    @IBOutlet var subtitle: UILabel!
    
    @IBOutlet var enableButton: UIButton!
    @IBOutlet var disableButton: UIButton!
    
    // MARK: - Storyboard actions
    @IBAction func onButtonClicked(sender: UIButton) {
        var type: ChannelTableViewActionType?
        
        switch sender {
        case enableButton:  type = .Enable
        case disableButton: type = .Disable
        default:
            break
        }
        
        if type != nil {
            delegate?.channelTableView(self, withAction: type!.rawValue)
        }
    }
}
