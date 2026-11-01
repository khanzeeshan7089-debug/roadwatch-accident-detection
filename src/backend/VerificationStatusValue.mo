import OQL "mo:caffeineai-oql";

// OQL value conversion for the incident verification-status variant.
module {
  public func _toRow(self : { #unverified; #verified; #falseAlarm }) : OQL.Value =
    #text(
      switch self {
        case (#unverified) { "unverified" };
        case (#verified) { "verified" };
        case (#falseAlarm) { "falseAlarm" };
      }
    );
};
