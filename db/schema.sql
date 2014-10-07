DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
       id uuid primary key default uuid_generate_v4(),
       at timestamp,
       sub_type varchar(16),
       sub_id uuid default null,
       verb varchar(32),
       obj_type varchar(16),
       obj_id uuid default null,
       attrs json
);

CREATE INDEX event_at ON events (at);
CREATE INDEX event_sub_type ON events (sub_type);
CREATE INDEX event_sub_id ON events (sub_id);
CREATE INDEX event_verb ON events (verb);
CREATE INDEX event_obj_type ON events (obj_type);
CREATE INDEX event_obj_id ON events (obj_id);
