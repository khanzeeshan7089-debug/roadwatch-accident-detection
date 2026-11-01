import OQL "mo:caffeineai-oql";

// OQL value conversion for the incident lifecycle-status variant.
module {
  public func _toRow(self : { #potential; #verified; #falseAlarm; #resolved }) : OQL.Value =
    #text(
      switch self {
        case (#potential) { "potential" };
        case (#verified) { "verified" };
        case (#falseAlarm) { "falseAlarm" };
        case (#resolved) { "resolved" };
      }
    );
};
