import OQL "mo:caffeineai-oql";

// OQL value conversion for the alert lifecycle-status variant.
module {
  public func _toRow(self : { #active; #acknowledged; #resolved }) : OQL.Value =
    #text(
      switch self {
        case (#active) { "active" };
        case (#acknowledged) { "acknowledged" };
        case (#resolved) { "resolved" };
      }
    );
};
