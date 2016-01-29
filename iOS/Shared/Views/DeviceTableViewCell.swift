//
//  DeviceTableViewCell.swift
//  FS20
//
//  Created by Manuel Stampfl on 15.09.15.
//  Copyright © 2015 Mani. All rights reserved.
//

import UIKit

@objc protocol DeviceTableViewCellDelegate {
    func deviceTableViewCellEnable(cell: DeviceTableViewCell)
    func deviceTableViewCellDisable(cell: DeviceTableViewCell)
}

class DeviceTableViewCell: UITableViewCell {

    // MARK: - Outlets
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var enableButton: UIButton!
    @IBOutlet weak var disableButton: UIButton!
    
    // MARK: - Vars
    weak var delegate: DeviceTableViewCellDelegate?
    weak var device: Device?
    
    // MARK: - Storyboard actions
    @IBAction private func onButton(sender: UIButton) {
        switch sender {
        case self.enableButton:
            self.delegate?.deviceTableViewCellEnable(self)
        case self.disableButton:
            self.delegate?.deviceTableViewCellDisable(self)
        default:
            break
        }
    }
    
}
