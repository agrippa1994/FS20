//
//  Style.swift
//  FS20
//
//  Created by Mani on 05.02.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit


class StyledTableView: UITableView {
    override func awakeFromNib() {
        super.awakeFromNib()
        self.backgroundColor = UIColor(fromRGB: 0x1F1F1F)
        self.separatorColor = UIColor(fromRGB: 0x272727)
    }
}

class StyledTableViewCell: UITableViewCell {
    override func awakeFromNib() {
        super.awakeFromNib()
        
        self.backgroundColor = UIColor(fromRGB: 0x181818)
        self.textLabel?.textColor = UIColor.whiteColor()
        self.detailTextLabel?.textColor? = UIColor.whiteColor()
        self.selectionStyle = .None
    }
}

class StyledTextField: UITextField {
    override func awakeFromNib() {
        super.awakeFromNib()
        
        self.textColor = UIColor.whiteColor()
        self.backgroundColor = UIColor.clearColor()
        self.keyboardAppearance = .Dark
        
        let attribute = self.attributedPlaceholder?.mutableCopy() as NSMutableAttributedString
        let placeholderColor = UIColor(fromRGB: 0x878787)
        attribute.setAttributes([NSForegroundColorAttributeName: placeholderColor], range: NSMakeRange(0, attribute.length))
        self.attributedPlaceholder = attribute
        
    }
}

class StyledLabel: UILabel {
    override func awakeFromNib() {
        super.awakeFromNib()
        
        self.textColor = UIColor.whiteColor()
    }
}